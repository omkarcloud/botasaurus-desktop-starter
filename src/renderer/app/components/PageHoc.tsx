import React, { useState, useEffect } from 'react';
import CenteredSpinner from './CenteredSpinner';
import ErrorComponent from './Error';
import { outputTaskServerSideProps, TaskFilterParams } from '../utils/props'
import { useParams, useSearchParams } from 'react-router-dom';

const PageHoc = (Page:any, getData:any) => {
  return (props:any) => {
    const [pageProps, setPageProps] = useState<any>(null);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const result = await getData();
          setPageProps(result);
        } catch (err) {
          setError(err);
        }
      };

      fetchData();
    }, []);

    if (error) {
      return <ErrorComponent error={error} />;
    }

    if (!pageProps) {
      return <CenteredSpinner />;
    }

    return <Page {...props} {...pageProps} />;
  };
};

// Helper to parse query params for task list filters
function parseOutputFilterParams(searchParams: URLSearchParams): TaskFilterParams {
  const params: TaskFilterParams = {};
  
  const page = searchParams.get('page');
  if (page) params.page = parseInt(page, 10);
  
  const search = searchParams.get('search');
  if (search) params.search = search;
  
  const status = searchParams.get('status');
  if (status) params.status = status;
  
  const taskKind = searchParams.get('task_kind');
  if (taskKind) params.task_kind = taskKind;
  
  const scraperName = searchParams.get('scraper_name');
  if (scraperName) params.scraper_name = scraperName;
  
  return params;
}

// HOC for Output page that reads search params and fetches data accordingly
const OutputPageHoc = (Page: any, getData: any) => {
  return function WrappedComponent(props: any) {
    const [pageProps, setPageProps] = useState<any>(null);
    const [error, setError] = useState<any>(null);
    const [searchParams] = useSearchParams();

    useEffect(() => {
      const fetchData = async () => {
        try {
          // Parse filter params inside effect to avoid stale closure issues
          const filterParams = parseOutputFilterParams(searchParams);
          // Pass filter params to the data fetching function
          const result = await getData(filterParams);
          setPageProps(result);
        } catch (err) {
          setError(err);
        }
      };

      fetchData();
    }, [searchParams, getData]); // Include dependencies used inside the effect

    if (error) {
      return <ErrorComponent error={error} />;
    }

    if (!pageProps) {
      return <CenteredSpinner />;
    }

    return <Page {...props} {...pageProps} />;
  };
};

export function convertStringToNumber(input: string): number {
  return parseInt(input, 10);
}

const OutputTaskHoc = (Page) => {
  return function WrappedComponent(props:any) {
    const [taskData, setTaskData] = useState<any>(null);
    const [error, setError] = useState<any>(null);
    const [searchParams] = useSearchParams();
    let { taskId:id } = useParams() as any;
    id = convertStringToNumber(id)

    // Parse query params for "Go Back" navigation (reuse the same helper)
    const queryParams = parseOutputFilterParams(searchParams);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const result = await outputTaskServerSideProps({ params: { taskId: id } });
          setTaskData(result);
        } catch (err) {
          setError(err);
        }
      };

      fetchData();
    }, [id]);

    if (error) {
      return <ErrorComponent error={error} />;
    }

    if (!taskData) {
      return <CenteredSpinner />;
    }

    return <Page {...props} {...taskData} queryParams={queryParams} />;
  };
};

export { PageHoc, OutputPageHoc, OutputTaskHoc };