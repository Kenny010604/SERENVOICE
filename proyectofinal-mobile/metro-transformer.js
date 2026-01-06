const upstreamTransformer = require('@expo/metro-config/babel-transformer');

module.exports.transform = async (props) => {
  // Aplicar el transformador upstream primero
  const result = await upstreamTransformer.transform(props);
  
  // Reemplazar import.meta con un objeto compatible
  if (result.output && result.output[0]) {
    result.output[0].data.code = result.output[0].data.code
      .replace(/import\.meta/g, '({})')
      .replace(/import\.meta\.url/g, '""');
  }
  
  return result;
};
