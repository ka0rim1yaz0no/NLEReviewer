import {useSyncExternalStore} from "react";
import {Award,BarChart3,BookOpen,CalendarDays,ChevronDown,Files,Gamepad2,GraduationCap,HeartPulse,HelpCircle,History,House,Layers3,LogOut,Menu,Moon,Pin,Settings,ShieldCheck,Sparkles,SquareCheckBig,Sun,User,Vault} from "lucide-react";
import {canAccessPDFs} from "./access";
import {useApp} from "./store";
import {Link,Modal} from "./ui";

const home={to:"/dashboard",label:"Home",icon:House};
const topics={to:"/topics",label:"Topics",icon:BookOpen};
const planner={to:"/schedule",label:"Study Plan",icon:CalendarDays};
const practice={to:"/practice",label:"Practice",icon:SquareCheckBig};
const mocks={to:"/mock",label:"Mock Boards",icon:GraduationCap};
const progress={to:"/performance",label:"Performance",icon:BarChart3};
const play={to:"/play",label:"Play",icon:Gamepad2};
const flashcards={to:"/decks",label:"Flashcards",icon:Layers3};
const cramSheets={to:"/resources",label:"Cram Sheets",icon:Files};
const primaryLinks=[play,cramSheets,practice,flashcards,planner];
const publicLinks=[
 {to:"/login",label:"Sign in",icon:User},
 {to:"/help",label:"Help & Support",icon:HelpCircle},
 {to:"/about",label:"About",icon:HeartPulse},
];
const menuGroups=[
 {label:"Study",links:[
  planner,flashcards,cramSheets,topics,
  {to:"/resources/pdfs",label:"PDF library",icon:Files},
  {to:"/wall",label:"My Wall",icon:Pin},
 ]},
 {label:"More practice",links:[
  mocks,{to:"/vault",label:"Vault",icon:Vault},play,
  {to:"/questions",label:"Question library",icon:BookOpen},
 ]},
 {label:"Progress",links:[
  progress,
  {to:"/history",label:"History",icon:History},
  {to:"/achievements",label:"Achievements",icon:Award},
 ]},
];
const accountLinks=[
 {to:"/profile",label:"Profile",icon:User},
 {to:"/settings",label:"Settings",icon:Settings},
 ...publicLinks.slice(1),
];
type NavItem=typeof home;
const allLinks=[home,practice,...menuGroups.flatMap(group=>group.links),...accountLinks,...publicLinks];
const colorScheme="(prefers-color-scheme: dark)";
function subscribeToColorScheme(callback:()=>void){
 const media=matchMedia(colorScheme);
 media.addEventListener("change",callback);
 return()=>media.removeEventListener("change",callback);
}
const systemDark=()=>matchMedia(colorScheme).matches;

export function isStudySession(route:string){
 return route.startsWith("/session/")||route.startsWith("/results/");
}
export function studyPageTitle(route:string,sessionTitle?:string){
 if(isStudySession(route))return sessionTitle||(route.startsWith("/results/")?"Results":"Practice session");
 const link=[...allLinks].sort((a,b)=>b.to.length-a.to.length).find(item=>route===item.to||route.startsWith(item.to+"/"));
 return link?.label||(route==="/"?"Home":"Study");
}

function NavLink({item,route,active,close}:{item:NavItem;route:string;active:string;close?:()=>void}){
 const current=route===item.to?"page":active===item.to?"location":undefined;
 return <Link to={item.to} className={current?"active":""} current={current} onNavigate={close}>
  <item.icon size={19} aria-hidden="true"/><span>{item.label}</span>
 </Link>;
}

export function ReviewerHeader({menuOpen,onMenu,onTour,hasSidebar,sidebarOpen,onSidebar}:{
 menuOpen:boolean;onMenu:()=>void;onTour:()=>void;hasSidebar:boolean;sidebarOpen:boolean;onSidebar:()=>void;
}){
 const {user,state,update}=useApp();
 const prefersDark=useSyncExternalStore(subscribeToColorScheme,systemDark);
 const theme=state.preferences.theme;
 const dark=theme==="dark"||(theme==="system"&&prefersDark);
 const toggleTheme=()=>update(current=>({...current,preferences:{...current.preferences,theme:dark?"light":"dark"}}));
 return <header className="site-header notebook-header study-navigation-header">
  <div className="header-inner">
   <button type="button" className="icon-btn menu-button" aria-label="Open menu" aria-haspopup="dialog" aria-expanded={menuOpen} onClick={onMenu}><Menu size={22}/></button>
   {hasSidebar&&<button type="button" className="icon-btn study-sidebar-toggle" aria-label={sidebarOpen?"Hide side menu":"Show side menu"} aria-controls="study-sidebar" aria-expanded={sidebarOpen} onClick={onSidebar}><Menu size={22}/></button>}
   <Link to={user?"/dashboard":"/login"} className="brand">
    <span className="brand-mark" aria-hidden="true"><HeartPulse size={22}/></span>
    <span className="brand-name">For Elaine Only <b>Reviewer</b></span>
   </Link>
   <div className="header-actions">
    <button type="button" className="icon-btn theme-toggle" aria-label={dark?"Switch to light mode":"Switch to dark mode"} onClick={toggleTheme}>{dark?<Sun size={19}/>:<Moon size={19}/>}</button>
    {user&&<button type="button" className="icon-btn desktop-tour" aria-label="Take the tour" onClick={onTour}><Sparkles size={19}/></button>}
    {user&&<Link to="/profile" className="header-avatar" label="Your profile">{state.profile.name.slice(0,2).toUpperCase()||"RN"}</Link>}
   </div>
  </div>
 </header>;
}

function StudyLinks({route,active,close}:{route:string;active:string;close?:()=>void}){
 const {user,username,sharedProfile}=useApp();
 const pdfAccess=canAccessPDFs(username,!!user,sharedProfile);
 const menuActive=allLinks.some(item=>item.to===route)?route:active;
 return <>
  <Link to={practice.to} className="btn primary study-nav-start" current={route===practice.to?"page":undefined} onNavigate={close}><practice.icon size={18} aria-hidden="true"/>Start practicing</Link>
  <div className="nav-group"><NavLink item={home} route={route} active={menuActive} close={close}/></div>
  {menuGroups.map(group=><div key={group.label} className="nav-group">
   <h3>{group.label}</h3>
   {group.links.filter(item=>item.to!=="/resources/pdfs"||pdfAccess).map(item=><NavLink key={item.to} item={item} route={route} active={menuActive} close={close}/>)}
  </div>)}
 </>;
}

export function StudySidebar({route,active,open}:{route:string;active:string;open:boolean}){
 const {switchProfile}=useApp();
 return <aside className="study-sidebar" id="study-sidebar" hidden={!open}>
  <nav aria-label="Main navigation"><StudyLinks route={route} active={active}/></nav>
  <details className="study-account nav-group">
   <summary><User size={18} aria-hidden="true"/>Account<ChevronDown size={15} aria-hidden="true"/></summary>
   {accountLinks.map(item=><NavLink key={item.to} item={item} route={route} active={active}/>)}
   <button type="button" className="btn" onClick={()=>void switchProfile()}><LogOut size={17}/>Switch profile</button>
  </details>
 </aside>;
}

export function StudyMenu({route,active,onClose,onTour}:{route:string;active:string;onClose:()=>void;onTour:()=>void}){
 const {user,sync,switchProfile}=useApp();
 return <Modal title="Menu" onClose={onClose} drawer>
  <nav aria-label="All pages">
   {user?<><StudyLinks route={route} active={active} close={onClose}/>
    <div className="nav-group"><h3>Account</h3>{accountLinks.map(item=><NavLink key={item.to} item={item} route={route} active={active} close={onClose}/>)}</div>
   </>:<div className="nav-group">{publicLinks.map(item=><NavLink key={item.to} item={item} route={route} active={active} close={onClose}/>)}</div>}
  </nav>
  <div className="drawer-actions">
   <button type="button" className="btn" onClick={()=>{onClose();onTour();}}><Sparkles size={17}/>Take the tour</button>
   {user&&<button type="button" className="btn" onClick={()=>{onClose();void switchProfile();}}><LogOut size={17}/>Switch profile</button>}
  </div>
  {user&&<p className="menu-foot"><ShieldCheck size={16} aria-hidden="true"/>{sync}</p>}
 </Modal>;
}

export function MobileStudyDock({route,active}:{route:string;active:string}){
 return <nav className="study-dock" aria-label="Quick study navigation">
  {primaryLinks.map(item=><NavLink key={item.to} item={item} route={route} active={active}/>)}
 </nav>;
}

export function ReviewerFooter(){
 const {user}=useApp();
 return <footer className="site-footer">
  <span><HeartPulse size={18} aria-hidden="true"/>For Elaine Only Reviewer</span>
  <div><Link to="/about">About</Link><Link to="/help">Help & study guide</Link>{user&&<Link to="/settings">Settings</Link>}</div>
 </footer>;
}
