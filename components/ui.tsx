'use client';
import type {ButtonHTMLAttributes,ReactNode} from 'react';
import AppIcon,{type IconName} from './AppIcon';
export function Button({variant='secondary',className='',children,...props}:ButtonHTMLAttributes<HTMLButtonElement>&{variant?:'primary'|'secondary'|'quiet';children:ReactNode}){return <button {...props} className={`ui-button ui-button-${variant} ${className}`}>{children}</button>}
export function IconButton({icon,label,className='',...props}:ButtonHTMLAttributes<HTMLButtonElement>&{icon:IconName;label:string}){return <button {...props} className={`ui-icon-button ${className}`} aria-label={label} title={label}><AppIcon name={icon} size={21}/></button>}
export function EmptyState({icon='compass',title,children,action}:{icon?:IconName;title:string;children:ReactNode;action?:ReactNode}){return <div className="ui-empty"><AppIcon name={icon} size={30}/><h3>{title}</h3><div>{children}</div>{action}</div>}
export function Skeleton({className=''}:{className?:string}){return <div className={`ui-skeleton ${className}`} aria-hidden="true"/>}
