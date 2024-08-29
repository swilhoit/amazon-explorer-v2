import React from 'react';
import { useCSVReader } from 'react-papaparse';
import { Button } from '@mui/material';
import { processData } from '../utils/dataProcessing';
import SearchIcon from "@mui/icons-material/Search";

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
                    <button
                        className="btn border-gray-200 dark:border-gray-700/60 shadow-sm text-violet-500 disabled:opacity-50 mr-2"
                        {...getRootProps()}
                    >
                        Upload
                    </button>
                </>
            )}
        </CSVReader>
    );
};

export default CSVUpload;
