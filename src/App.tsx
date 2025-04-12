// App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ExerciseTracking from "./pages/ExerciseTracking";

const App = () => {

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <ExerciseTracking />
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
