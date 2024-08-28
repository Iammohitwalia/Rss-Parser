// app/page.js

"use client";
import { useState } from "react";
import { TextField, Button, Container, Typography } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Create a Material-UI theme with custom styles
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // Custom primary color
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px", // Rounded corners for buttons
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: "8px", // Rounded corners for text fields
        },
      },
    },
  },
});

export default function Home() {
  const [rssUrl, setRssUrl] = useState("");
  const [output, setOutput] = useState("");
  const [podcastTitle, setPodcastTitle] = useState("");

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/parse-rss", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rssUrl }),
      });

      if (response.ok) {
        const data = await response.json();
        setOutput(data.textOutput);
        setPodcastTitle(data.podcastTitle);

        // Create and download the text file with dynamic file name
        const blob = new Blob([data.textOutput], { type: "text/plain" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${data.podcastTitle.replace(/[^a-z0-9]/gi, '_')}.txt`; // Dynamic filename based on podcast title, sanitized
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        console.error("Failed to fetch the RSS feed");
      }
    } catch (error) {
      console.error("An error occurred while fetching the RSS feed", error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container className="container">
        <Typography variant="h4" gutterBottom align="center">
          RSS Feed Parser
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Enter RSS feed URL"
            variant="outlined"
            fullWidth
            value={rssUrl}
            onChange={(e) => setRssUrl(e.target.value)}
            required
          />
          <Button variant="contained" color="primary" type="submit">
            Submit
          </Button>
        </form>
        {output && (
          <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
            {output}
          </pre>
        )}
      </Container>
    </ThemeProvider>
  );
}
