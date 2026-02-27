import axios from "axios";

// Get completed chapters for a course
export const fetchCompletedChapters = async (courseId, token) => {
  const res = await axios.get(`/api/progress/completed`, {
    params: { courseId },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.completedChapters || [];
};

// Mark or unmark a chapter
export const updateChapterProgress = async (
  courseId,
  chapterId,
  completed,
  token,
) => {
  const res = await axios.post(
    `/api/progress/mark`,
    { courseId, chapterId, completed },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data.completedChapters || [];
};
