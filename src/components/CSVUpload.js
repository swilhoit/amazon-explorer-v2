import React from 'react';
import { useCSVReader } from 'react-papaparse';
import { Button } from '@mui/material';
import { processData } from '../utils/dataProcessing';

const CSVUpload = ({ onDataUpload, setLoading }) => {
    const { CSVReader } = useCSVReader();

    const handleOnDrop = (results) => {
        setLoading(true);
        console.log('CSV Upload - Raw data:', results.data);

        const processedData = processData(results.data);
        console.log('CSV Upload - Processed data:', processedData);

        if (processedData.length > 0) {
            onDataUpload(processedData);
        } else {
            console.log('CSV Upload - No data processed from CSV');
            onDataUpload([]);
        }

        setLoading(false);
    };

    const handleOnError = (err, file, inputElem, reason) => {
        console.error('CSV upload error:', err, reason);
        setLoading(false);
    };

    return (
        <CSVReader
            onUploadAccepted={handleOnDrop}
            onError={handleOnError}
            config={{
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
            }}
        >
            {({ getRootProps, acceptedFile, ProgressBar, getRemoveFileProps }) => (
                <>
                    <Button variant="contained" {...getRootProps()}>
                        Upload CSV
                    </Button>
               
                    
                </>
            )}
        </CSVReader>
    );
};

export default CSVUpload;