import Home from './pages/Home'
import Proposals from './pages/Proposals'
import Proposal from './pages/Proposal'
import CreateProposal from './pages/CreateProposal'
import Assets from './pages/Assets'
import Shareholders from './pages/Shareholders'
import Delegates from './pages/Delegates'
import Help from './pages/Help'

export default [
  { path: '/', component: Home },
  { path: '/proposals', component: Proposals },
  { path: '/proposals/create', component: CreateProposal },
  { path: '/proposals/:id', component: Proposal },
  { path: '/assets', component: Assets },
  { path: '/shareholders', component: Shareholders },
  { path: '/delegates', component: Delegates },
  { path: '/help', component: Help }
]
