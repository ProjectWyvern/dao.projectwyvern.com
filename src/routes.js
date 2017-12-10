import Home from './pages/Home'
import Proposals from './pages/Proposals'
import Assets from './pages/Assets'
import Shareholders from './pages/Shareholders'
import Delegates from './pages/Delegates'
import Help from './pages/Help'

export default [
  { path: '/', component: Home },
  { path: '/proposals', component: Proposals },
  { path: '/assets', component: Assets },
  { path: '/shareholders', component: Shareholders },
  { path: '/delegates', component: Delegates },
  { path: '/help', component: Help }
]
