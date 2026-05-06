import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usePhotos } from './usePhotos'
import { PAGE_SIZE } from '../lib/api'

const makeMockPhotos = (start: number, count: number) =>
  Array.from({ length: count }, (_, i) => ({
    albumId: 1,
    id: start + i + 1,
    title: `photo ${start + i + 1}`,
    url: `https://example.com/${start + i + 1}`,
    thumbnailUrl: `https://example.com/thumb/${start + i + 1}`,
  }))

beforeEach(() => {
  vi.resetAllMocks()
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(makeMockPhotos(0, PAGE_SIZE)),
  } as unknown as Response)
})

describe('usePhotos', () => {
  it('마운트 시 4개 사진을 로딩한다', async () => {
    const { result } = renderHook(() => usePhotos())

    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.photos).toHaveLength(4)
    expect(fetch).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/photos?_start=0&_limit=4',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    )
  })

  it('loadMore 호출 시 4개를 추가로 불러온다', async () => {
    const { result } = renderHook(() => usePhotos())
    await waitFor(() => expect(result.current.photos).toHaveLength(4))

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(makeMockPhotos(4, PAGE_SIZE)),
    } as unknown as Response)

    act(() => result.current.loadMore())
    await waitFor(() => expect(result.current.photos).toHaveLength(8))

    expect(fetch).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/photos?_start=4&_limit=4',
      expect.objectContaining({ signal: undefined })
    )
  })

  it('5000개 미만일 때 hasMore는 true이다', async () => {
    const { result } = renderHook(() => usePhotos())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.hasMore).toBe(true)
  })

  it('로딩 중일 때 loading은 true이다', async () => {
    let resolveJson!: (v: unknown) => void
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => new Promise(res => { resolveJson = res }),
    } as unknown as Response)

    const { result } = renderHook(() => usePhotos())
    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(resolveJson).toBeDefined())
    act(() => resolveJson(makeMockPhotos(0, PAGE_SIZE)))
    await waitFor(() => expect(result.current.loading).toBe(false))
  })

  it('API 실패 시 error 메시지를 반환한다', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve([]),
    } as unknown as Response)

    const { result } = renderHook(() => usePhotos())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('HTTP 500')
    expect(result.current.photos).toHaveLength(0)
  })

  it('로딩 중에 loadMore를 호출해도 중복 fetch가 발생하지 않는다', async () => {
    let callCount = 0
    global.fetch = vi.fn().mockImplementation(() => {
      callCount++
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(makeMockPhotos(0, PAGE_SIZE)),
      } as unknown as Response)
    })

    const { result } = renderHook(() => usePhotos())
    // loadMore called during initial fetch — should be no-op
    act(() => result.current.loadMore())
    act(() => result.current.loadMore())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(callCount).toBe(1)
  })

  it('초기 로딩 후 hasMore는 true이고 photos는 4개이다', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(makeMockPhotos(0, PAGE_SIZE)),
    } as unknown as Response)

    const { result } = renderHook(() => usePhotos())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.hasMore).toBe(true)
    expect(result.current.photos).toHaveLength(4)
  })

  it('StrictMode에서 초기 사진을 정상적으로 불러온다', async () => {
    const { configure } = await import('@testing-library/react')
    configure({ reactStrictMode: true })
    try {
      const { result } = renderHook(() => usePhotos())
      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.photos).toHaveLength(4)
    } finally {
      configure({ reactStrictMode: false })
    }
  })
})
