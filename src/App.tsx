// App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ExerciseTracking from "./pages/ExerciseTracking";
import Auth from "./pages/AuthPage";

const App = () => {

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Auth />
          }
        />
        <Route
          path="/auth-page"
          element={
            <Auth />
          }
        />
        <Route
          path="/exercise-tracking"
          element={
            <ExerciseTracking />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
