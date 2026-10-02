import { defineConfig } from '@playwright/test';
export default defineConfig({
 testDir:'./tests/online',timeout:60000,workers:1,reporter:'list',
 use:{baseURL:'http://127.0.0.1:4173',browserName:'chromium',reducedMotion:'reduce',actionTimeout:10000,
  launchOptions:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader']}:{}},
 projects:[{name:'online-desktop',use:{viewport:{width:1280,height:900}}},{name:'online-360',use:{viewport:{width:360,height:800}}}],
 webServer:[
  {command:'node tests/server/browser-server.mjs',url:'http://127.0.0.1:3001/health',timeout:30000},
  {command:'VITE_AUTH_MODE=online npm run build && npm run preview -- --host 127.0.0.1',url:'http://127.0.0.1:4173',timeout:60000},
 ],
});
