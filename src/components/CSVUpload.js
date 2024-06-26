import React from 'react';
import { useCSVReader } from 'react-papaparse';
import { Button } from '@mui/material';
import { processData } from '../utils/dataProcessing';

const CSVUpload = ({ onDataUpload, setLoading }) => {
    const { CSVReader } = useCSVReader();

    const handleOnDrop = (results) => {
        setLoading(true);
        console.log('CSV data:', results.data); // Log raw CSV data

        const processedData = processData(results.data);
        console.log('Processed data:', processedData); // Log processed data

        if (processedData.length > 0) {
            onDataUpload(processedData);
        } else {
            console.log('No data processed from CSV');
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
                    <div>
                        {acceptedFile && acceptedFile.name}
                        <Button {...getRemoveFileProps()}>Remove</Button>
                    </div>
                    <ProgressBar />
                </>
            )}
        </CSVReader>
    );
};

export default CSVUpload;
