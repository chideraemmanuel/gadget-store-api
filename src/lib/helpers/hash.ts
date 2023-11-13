import bcrypt from 'bcrypt';

export const hashData = async (data: string, saltRounds: number = 10) => {
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedData = await bcrypt.hash(data, salt);

  return hashedData;
};

export const compareHash = async (data: string, hashedData: string) => {
  return await bcrypt.compare(data, hashedData);
};
