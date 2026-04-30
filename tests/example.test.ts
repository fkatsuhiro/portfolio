import { describe, it, expect } from 'vitest';

// This would be a real import from your source code, e.g.:
// import { sortPosts } from '../../src/utils/sorting';

// For this example, we'll define the types and function directly in the test.
interface Post {
  title: string;
  date: string; // YYYY-MM-DD
}

const sortPosts = (posts: Post[], order: 'newest' | 'oldest' = 'newest'): Post[] => {
  // Create a shallow copy to avoid mutating the original array
  return [...posts].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return order === 'newest' ? dateB - dateA : dateA - dateB;
  });
};


describe('sortPosts utility', () => {
  const mockPosts: Post[] = [
    { title: 'Post 2', date: '2023-05-15' },
    { title: 'Post 1', date: '2022-01-20' },
    { title: 'Post 3', date: '2024-08-01' },
  ];

  it('should sort posts by newest date by default', () => {
    const sorted = sortPosts(mockPosts);
    
    expect(sorted[0].title).toBe('Post 3'); // 2024-08-01
    expect(sorted[1].title).toBe('Post 2'); // 2023-05-15
    expect(sorted[2].title).toBe('Post 1'); // 2022-01-20
  });

  it('should sort posts by newest date when explicitly specified', () => {
    const sorted = sortPosts(mockPosts, 'newest');
    
    expect(sorted.map(p => p.title)).toEqual(['Post 3', 'Post 2', 'Post 1']);
  });

  it('should sort posts by oldest date when specified', () => {
    const sorted = sortPosts(mockPosts, 'oldest');
    
    expect(sorted.map(p => p.title)).toEqual(['Post 1', 'Post 2', 'Post 3']);
  });

  it('should return an empty array if given an empty array', () => {
    const sorted = sortPosts([]);
    expect(sorted).toEqual([]);
  });

  it('should not mutate the original array', () => {
    const originalPosts = [...mockPosts];
    sortPosts(mockPosts, 'newest');
    expect(mockPosts).toEqual(originalPosts);
  });
});