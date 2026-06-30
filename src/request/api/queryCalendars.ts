import { request } from '@/request';

const queryCalendars = async () => {
  // ponytail: calendar API is public, no auth needed
  return await request.get(`/calendar/getCalendars`, undefined, {
    isToken: false,
  });
};

export default queryCalendars;
