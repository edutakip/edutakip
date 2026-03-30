import Landing from './pages/Landing';
import ParentDashboard from './pages/ParentDashboard';
import ParentHomework from './pages/ParentHomework';
import ParentMessages from './pages/ParentMessages';
import ParentPerformance from './pages/ParentPerformance';
import TeacherCalendar from './pages/TeacherCalendar';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherFinance from './pages/TeacherFinance';
import TeacherHomework from './pages/TeacherHomework';
import TeacherLessons from './pages/TeacherLessons';
import TeacherMessages from './pages/TeacherMessages';
import TeacherStudents from './pages/TeacherStudents';
import Page1 from './pages/Page1';
import __Layout from './Layout.jsx';

export const PAGES = {
    "Landing": Landing,
    "ParentDashboard": ParentDashboard,
    "ParentHomework": ParentHomework,
    "ParentMessages": ParentMessages,
    "ParentPerformance": ParentPerformance,
    "TeacherCalendar": TeacherCalendar,
    "TeacherDashboard": TeacherDashboard,
    "TeacherFinance": TeacherFinance,
    "TeacherHomework": TeacherHomework,
    "TeacherLessons": TeacherLessons,
    "TeacherMessages": TeacherMessages,
    "TeacherStudents": TeacherStudents,
    "Page1": Page1,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};