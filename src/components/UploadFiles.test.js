import {
    render,
    fireEvent,
    act,
    screen,
} from "@testing-library/react";
import axios from "axios";
import UploadFiles from "./UploadFiles";

jest.mock("axios");

describe("UploadFiles component", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should upload a file with 10 minute retention", async () => {
        const expectedUrl = "http://localhost:8080/v1/file";
        const resultUrl ="http://localhost:8080/v1/file1_1681908880034307000.jpeg";
        const file = new File(["file contents"], "filename.txt", {
            type: "text/plain",
        });
        const expectedData = new FormData();
        expectedData.append("file", file);
        const expectedHeaders = {
            "Content-Type": "multipart/form-data",
            "File-TTL": "10",
        };

        axios.put.mockResolvedValueOnce({
            data: {url: resultUrl},
        });

        render(<UploadFiles/>);

        const data = mockData([file]);

        const button = screen.getByText("Upload")
        expect(button).toBeDisabled()

        await act(() =>
            fireEvent.drop(
                screen.getByText("Drag and drop file here, or click to select file"),
                data
            )
        );

        fireEvent.change(screen.getByLabelText("expiration time(in minutes):"), {
            target: {value: "10"},
        });

        await act(() => fireEvent.click(button));

        expect(axios.put).toHaveBeenCalledTimes(1);
        expect(axios.put).toHaveBeenCalledWith(expectedUrl, expectedData, {
            headers: expectedHeaders
        });

      expect(screen.getByText("Here's your shareable URL:")).toBeInTheDocument();
      expect(screen.getByDisplayValue(resultUrl)).toBeInTheDocument();
    });

    test("should upload a file with 1 minute default retention", async () => {
        const expectedUrl = "http://localhost:8080/v1/file";
        const resultUrl ="http://localhost:8080/v1/file1_1681908880034307000.jpeg";
        const file = new File(["file contents"], "filename.txt", {
            type: "text/plain",
        });
        const expectedData = new FormData();
        expectedData.append("file", file);
        const expectedHeaders = {
            "Content-Type": "multipart/form-data",
            "File-TTL": "1",
        };

        axios.put.mockResolvedValueOnce({
            data: {url: resultUrl},
        });

        render(<UploadFiles/>);

        const data = mockData([file]);

        const button = screen.getByText("Upload")
        expect(button).toBeDisabled()

        await act(() =>
            fireEvent.drop(
                screen.getByText("Drag and drop file here, or click to select file"),
                data
            )
        );

        await act(() => fireEvent.click(button));

        expect(axios.put).toHaveBeenCalledTimes(1);
        expect(axios.put).toHaveBeenCalledWith(expectedUrl, expectedData, {
            headers: expectedHeaders
        });

      expect(screen.getByText("Here's your shareable URL:")).toBeInTheDocument();
      expect(screen.getByDisplayValue(resultUrl)).toBeInTheDocument();
    });

    test("should display error message if file upload fails", async () => {
        axios.put.mockRejectedValue(new Error("Upload failed"));

        render(<UploadFiles/>);

        const data = mockData([
            new File(["test"], "test.png", {type: "image/png"}),
        ]);

        fireEvent.change(screen.getByLabelText("expiration time(in minutes):"), {
            target: {value: "10"},
        });

        const button = screen.getByText("Upload")
        expect(button).toBeDisabled()

        await act(() =>
            fireEvent.drop(
                screen.getByText("Drag and drop file here, or click to select file"),
                data
            )
        );

        await act(() => fireEvent.click(button));

        expect(
            screen.getByText("File upload failed. Please try again.")
        ).toBeInTheDocument();
        expect(axios.put).toHaveBeenCalled();
    });
});

function mockData(files) {
    return {
        dataTransfer: {
            files,
            items: files.map((file) => ({
                kind: "file",
                type: file.type,
                getAsFile: () => file,
            })),
            types: ["Files"],
        },
    };
}
