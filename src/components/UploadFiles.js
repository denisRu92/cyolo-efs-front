import React, {useState} from "react";
import Dropzone from "react-dropzone";
import axios from "axios";
import Modal from "react-modal";

function UploadFiles() {
    const baseURL = "http://localhost:8080";
    const [file, setFile] = useState(null);
    const [retentionTime, setRetentionTime] = useState("");
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [sharableURL, setSharableURL] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const onDrop = (acceptedFiles) => {
        setFile(acceptedFiles[0]);
    };

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append("file", file);
        let ttl = "1";
        if (
            retentionTime !== "" &&
            retentionTime !== undefined &&
            retentionTime !== null
        ) {
            ttl = retentionTime;
        }

        try {
            const response = await axios.put(baseURL + "/v1/file", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "File-TTL": ttl,
                },
            });
            setSharableURL(response.data.url);
            setModalIsOpen(true);
            setErrorMessage("");
        } catch (error) {
            console.log(error);
            setErrorMessage("File upload failed. Please try again.");
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(sharableURL);
    };

    const clearFile = () => {
        setModalIsOpen(false);
        setSharableURL("");
        setRetentionTime("");
        setFile(null);
    };

    return (
        <>
            <Dropzone onDrop={onDrop} multiple={false}>
                {({getRootProps, getInputProps}) => (
                    <section>
                        <div {...getRootProps({className: "dropzone"})}>
                            <input data-testid="fileInput" {...getInputProps()} />
                            {file && file.name ? (
                                <div className="selected-file">{file && file.name}</div>
                            ) : (
                                "Drag and drop file here, or click to select file"
                            )}
                        </div>
                    </section>
                )}
            </Dropzone>
            <div className="data-container">
                <label htmlFor="expirationTime">expiration time(in minutes):</label>
                <input
                    id="expirationTime"
                    type="number"
                    value={retentionTime}
                    onChange={(e) => setRetentionTime(e.target.value)}
                />
            </div>
            <div className="central">
                <button
                    className="btn btn-success"
                    disabled={!file}
                    onClick={handleSubmit}
                >
                    Upload
                </button>
            </div>
            <div className="alert alert-light central" role="alert">
                {errorMessage}
            </div>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={clearFile}
                className="modal-content"
            >
                <div className="modal-container">
                    <h3>Here's your shareable URL:</h3>
                    <input type="text" value={sharableURL} readOnly/>
                    <button className="btn btn-success" onClick={copyToClipboard}>
                        Copy to clipboard
                    </button>
                </div>
            </Modal>
        </>
    );
}

export default UploadFiles;
