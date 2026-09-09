import useUserStore from '@/store/user';

export const getFeedbackUser = () => {
  const studentId = useUserStore.getState().student_id;
  return studentId
    ? JSON.stringify({ state: { student_id: studentId } })
    : null;
};
