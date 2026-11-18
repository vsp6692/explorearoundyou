import {appPath} from './app-path';
const icons:Record<string,string>={Food:'food',Stays:'stays',Beaches:'beaches',Parks:'parks',Attractions:'attractions',Shopping:'shopping',Fun:'fun'};
export function pixelIcon(category:string,mystery=false){return appPath(`/icons/pixel/${mystery?'mystery':Object.hasOwn(icons,category)?icons[category]:'compass'}.svg`)}
