
import { EuiProvider } from '@elastic/eui/optimize/es/components/provider/provider';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages';
import AboutPage from './pages/about';
import OutputPage from './pages/output-pages/output';
import OutputTaskPage from './pages/output-pages/output-task';
import FactoryResetModal from './components/FactoryResetModal';


const Main = () => {
    return (
        <EuiProvider colorMode="light">
          <FactoryResetModal/>
                <Router>
      <Routes>
      <Route  path="/output/:taskId" element={<OutputTaskPage />} />
        <Route path="/output" element={<OutputPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
        </EuiProvider>
    )
}

export default Main