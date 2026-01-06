const upstreamTransformer = require('@expo/metro-config/babel-transformer');

module.exports.transform = async (props) => {
  // Transformar con el transformador upstream primero
  const result = await upstreamTransformer.transform(props);
  
  // Después de la transformación, reemplazar import.meta en el código
  if (result.output && result.output[0] && result.output[0].data && result.output[0].data.code) {
    result.output[0].data.code = result.output[0].data.code
      .replace(/import\.meta\.url/g, '""')
      .replace(/import\.meta/g, '({})');
  }
  
  return result;
};
