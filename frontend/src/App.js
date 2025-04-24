import { BrowserRouter, Route, Routes } from "react-router-dom";
import RouteScrollToTop from "./helper/RouteScrollToTop";
import SignInPage from "./pages/SignInPage";
import HomePageTen from "./pages/HomePageTen";
import CleaningPage from "./pages/tickets/CleaningPage";

function App() {
  return (
    <BrowserRouter>
      <RouteScrollToTop />
      <Routes>
      <Route exact path='/sign-in' element={<SignInPage />} />
        <Route exact path='/' element={<HomePageTen />} />
        <Route exact path='/cleaning' element={<CleaningPage />} />

       
      </Routes>
    </BrowserRouter>
  );
}

export default App;
