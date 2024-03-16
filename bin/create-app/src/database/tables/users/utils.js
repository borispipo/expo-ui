import { faker } from '@faker-js/faker';
export function createRandomUser (){
    return {
      userId: faker.string.uuid(),
      username: faker.internet.userName(),
      amount : faker.number.int(),
      email: faker.internet.email(),
      avatar: faker.image.dataUri({height:50,width:50}),
      password: faker.internet.password(),
      birthdate: faker.date.birthdate(),
      registeredAt: faker.date.past(),
    };
  }
  
  export const generateData = (count)=>{
    count = typeof count =='number' && count > 5 ? count : 10000;
    return faker.helpers.multiple(createRandomUser, {
        count,
    });
  }