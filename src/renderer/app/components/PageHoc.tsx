import React, { useState, useEffect } from 'react';
import CenteredSpinner from './CenteredSpinner';
import ErrorComponent from './Error';
import { outputTaskServerSideProps } from '../utils/props'
import { useParams } from 'react-router-dom';

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

export function convertStringToNumber(input: string): number {
  return parseInt(input, 10);
}
const OutputTaskHoc = (Page) => {
  return function WrappedComponent(props:any) {
    const [taskData, setTaskData] = useState<any>(null);
    const [error, setError] = useState<any>(null);
    let { taskId:id } = useParams() as any;
    id = convertStringToNumber(id)

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

    return <Page {...props} {...taskData} />;
  };
};

export  {PageHoc, OutputTaskHoc};