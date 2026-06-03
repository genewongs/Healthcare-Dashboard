import { Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/Layout";
import { CreatePatientPage } from "./pages/CreatePatientPage";
import { DashboardPage } from "./pages/DashboardPage";
import { EditPatientPage } from "./pages/EditPatientPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PatientDetailPage } from "./pages/PatientDetailPage";
import { PatientsList } from "./pages/PatientsList";
import "./styles.css";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/patients" element={<PatientsList />} />
        <Route path="/patients/new" element={<CreatePatientPage />} />
        <Route path="/patients/:id/edit" element={<EditPatientPage />} />
        <Route path="/patients/:id" element={<PatientDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
