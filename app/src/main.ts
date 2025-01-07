import { mount } from 'svelte'
import "./theme.css";
import './app.css'
import "./style/anchor-button.css";
import App from './App.svelte'

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app;