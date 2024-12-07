import { fakerZH_CN as faker } from '@faker-js/faker';

export const mockConfig = {
  urlPrefix: process.env.EXPO_PUBLIC_API_URL,
  routes: [
    {
      method: 'get',
      path: '/api/courses',
      handler: () => {
        const courses = Array.from({ length: 15 }, () => ({
          id: faker.string.uuid(),
          courseName: faker.lorem.word(),
          time: faker.date.future().toLocaleTimeString(),
          date: faker.date.weekday(),
          teacher: faker.person.fullName(),
          classroom: faker.location.direction(),
        }));
        return { courses };
      },
    },
    {
      method: 'get',
      path: '/api/teachers',
      handler: () => {
        return {
          teachers: Array.from({ length: 10 }, () => ({
            id: faker.string.uuid(),
            name: faker.person.fullName(),
            subject: faker.lorem.word(),
          })),
        };
      },
    },
  ],
};
