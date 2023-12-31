import NavBar from './components/NavBar'
import HomePage from './components/HomePage';
import NatParkPage from './components/NatParkPage';
import './App.css'
import './css/NavBar.css'
import './css/HomePage.css'
import './css/AdventureAutocomplete.css'
import './css/SelectedPark.css'
import './css/Map.css'
import './css/SelectedActivity.css'
import { createBrowserRouter as Routes, Route, BrowserRouter, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom'
import SelectedActivity from './components/SelectedActivity';

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<NavBar />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/NatParkPage" element={<NatParkPage />} />
        <Route path="/SelectedActivity" element={<SelectedActivity />} />
      </Route>
    )
  );

  return (
    <div className="App">
      <RouterProvider router={router}/>
    </div>
  );
}

export default App
