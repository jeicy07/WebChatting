import React from 'react'
import { render } from 'react-dom'
import { Router, Route, hashHistory , browserHistory} from 'react-router'

import Home from './view/home.jsx'
import Chat from './view/chat.jsx'
import Register from './view/register.jsx'
import './style/main.less'

render((
  <Router history={browserHistory}>
    <Route path="/" component={Home}/>
    <Route path="/chat" component={Chat}/>
    <Route path="/register" component={Register}/>
  </Router>
), document.getElementById('app'))
