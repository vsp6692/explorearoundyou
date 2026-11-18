import type { NextConfig } from 'next';
import {appPath} from './lib/app-path';
const config: NextConfig = { output: 'export', trailingSlash:true, basePath:appPath('/').slice(0,-1), allowedDevOrigins: ['127.0.0.1'] };
export default config;
