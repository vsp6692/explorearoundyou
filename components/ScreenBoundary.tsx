'use client';
import {appPath} from '../lib/app-path';
import {Component,Fragment,type ReactNode} from 'react';
type Props={children:ReactNode;label:string;onProfile?:()=>void;resetKey?:string|boolean};
export default class ScreenBoundary extends Component<Props,{failed:boolean;attempt:number}>{
 state={failed:false,attempt:0};
 static getDerivedStateFromError(){return {failed:true}}
 componentDidUpdate(previous:Props){if(previous.resetKey!==this.props.resetKey&&this.state.failed)this.setState({failed:false})}
 render(){if(this.state.failed)return <section className="screen-recovery" role="alert"><h2>Let’s reopen {this.props.label}.</h2><p>This view couldn’t finish loading. Your saved device data has not been cleared.</p><button className="ui-button ui-button-primary" onClick={()=>this.setState(s=>({failed:false,attempt:s.attempt+1}))}>Try this view again</button>{this.props.onProfile&&<button className="ui-button" onClick={this.props.onProfile}>Open Profile &amp; backups</button>}<a href={appPath('/')}>Return to Explore</a></section>;return <Fragment key={this.state.attempt}>{this.props.children}</Fragment>}
}
