module.exports = {
    preset: 'ts-jest',                      // Utiliza ts-jest para compilar TypeScript
    testEnvironment: 'node',                // Configura el entorno de pruebas (puede ser 'node' o 'jsdom')
    moduleFileExtensions: ['ts', 'tsx', 'js'], // Extensiones de archivo que Jest reconocerá
    moduleDirectories: ['node_modules', 'src'], // Directorios que Jest debe considerar para la resolución de módulos
    moduleNameMapper: {
      '^constants/(.*)$': '<rootDir>/src/constants/$1', // Mapea rutas personalizadas de TypeScript a las reales
      // Agrega más alias si los tienes en tsconfig.json
    },
    transform: {
      '^.+\\.tsx?$': 'ts-jest'              // Transforma archivos .ts y .tsx utilizando ts-jest
    },
    testMatch: ['**/?(*.)+(spec|test).ts?(x)'], // Patrón para detectar archivos de prueba
    collectCoverage: false,                  // Recoge información de cobertura
    coverageDirectory: 'coverage',          // Directorio donde almacenar la cobertura de código
    coverageReporters: ['text', 'lcov'],    // Formatos para reportar la cobertura de código
  };
  