/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Landing from './pages/Landing';
import ParentDashboard from './pages/ParentDashboard';
import ParentMessages from './pages/ParentMessages';
import TeacherCalendar from './pages/TeacherCalendar';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherFinance from './pages/TeacherFinance';
import TeacherMessages from './pages/TeacherMessages';
import TeacherStudents from './pages/TeacherStudents';
import TeacherLessons from './pages/TeacherLessons';
import ParentPerformance from './pages/ParentPerformance';
import TeacherHomework from './pages/TeacherHomework';
import ParentHomework from './pages/ParentHomework';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Landing": Landing,
    "ParentDashboard": ParentDashboard,
    "ParentMessages": ParentMessages,
    "TeacherCalendar": TeacherCalendar,
    "TeacherDashboard": TeacherDashboard,
    "TeacherFinance": TeacherFinance,
    "TeacherMessages": TeacherMessages,
    "TeacherStudents": TeacherStudents,
    "TeacherLessons": TeacherLessons,
    "ParentPerformance": ParentPerformance,
    "TeacherHomework": TeacherHomework,
    "ParentHomework": ParentHomework,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};