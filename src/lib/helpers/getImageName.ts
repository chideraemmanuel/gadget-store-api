const getImageName = (absoluteUrl: string) => {
  const imageName = absoluteUrl
    .substring(absoluteUrl.lastIndexOf('/'))
    .slice(1);

  return imageName;
};

export default getImageName;
