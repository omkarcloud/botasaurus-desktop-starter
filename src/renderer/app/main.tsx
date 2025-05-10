
import { EuiProvider } from '@elastic/eui/optimize/es/components/provider/provider';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages';
import AboutPage from './pages/about';
import ApiIntegration from './pages/api-integration';
import OutputPage from './pages/output-pages/output';
import OutputTaskPage from './pages/output-pages/output-task';
import FactoryResetModal from './components/FactoryResetModal';
import Links from './utils/data/links'


const Main = () => {
    return (
        <EuiProvider colorMode="light">
          <FactoryResetModal/>
                <Router>
      <Routes>
      <Route  path="/output/:taskId" element={<OutputTaskPage />} />
        <Route path={Links.output} element={<OutputPage />} />
        <Route path={Links.about} element={<AboutPage />} />
        <Route path={Links.apiIntegration} element={<ApiIntegration />} />
        <Route path={Links.home} element={<HomePage />} />
      </Routes>
    </Router>
        </EuiProvider>
    )
}

export default Main