<script>
    import { onMount, tick } from 'svelte';
    import { marked } from 'marked';
    import { fullDocument } from "../data/fullDocument";
    import { annotations } from "../data/documentAnnotations";
  
    export let datasetId;
  
    let annotatedDocument = ''; 
    let showAllAnnotations = false; 
    let highlightId = '';  
    let lastUrl = ''; // Track last URL to detect changes manually ---added
  
  // ✅ Extract `datasetId` and `highlightId` from URL when page loads
  function extractParams() {
      let path = window.location.pathname;
      datasetId = path.split('/').pop(); // Extract dataset1, dataset2, etc.

      const params = new URLSearchParams(window.location.search);
      highlightId = params.get('id') || ''; // Extract highlight ID

      console.log(`📌 Extracted datasetId: ${datasetId}`);
      console.log(`🔍 Extracted highlightId: ${highlightId}`);

      updateHighlights();
  }

  // ✅ Reactively update the document when `highlightId` changes
    $: if (highlightId) {
        console.log(`🟢 Reactive Trigger: Updating Highlights for ${highlightId}`);
        updateHighlights();
    }

  // Function to apply highlights when navigating
  async function updateHighlights() {
        await tick();
        annotatedDocument = annotateDocument(fullDocument, annotations);

        console.log("📝 Updated `annotatedDocument`:", annotatedDocument ? annotatedDocument.slice(0, 500) + "..." : "❌ No content!");
        
        await tick(); //wait for new URL to be rendered 
         // ✅ Log rendered HTML to check if the span exists
        setTimeout(() => {
            const content = document.querySelector('.example-document')?.innerHTML;
            console.log("🔎 Checking rendered HTML:", content ? content.slice(0, 500) + "..." : "❌ No content found!");

            if (highlightId) {
                console.log(`Applying highlight: ${highlightId}`);
                // setTimeout(() => scrollToHighlight(highlightId), 100);

                //  // ✅ Check if highlight exists in rendered HTML
                // let element = document.getElementById(highlightId);
                // if (element) {
                //     console.log(`🎯 Found highlight span for ${highlightId}!`);
                // } else {
                //     console.warn(`⚠️ Highlight span for ${highlightId} NOT found in rendered document.`);
                // }

                retryScrollToHighlight(highlightId, 5); // ✅ Try scrolling up to 5 times
            }
    }, 500); //delay to ensure content is rendered before scrolling 
  }

  //retry when document is ready
  function retryScrollToHighlight(id, retries) {
    if (retries === 0) {
        console.error(`❌ Highlight ID "${id}" STILL NOT FOUND after retry!`);
        return;
    }

    setTimeout(() => {
        let element = document.getElementById(id);
        let documentContainer = document.querySelector('.example-document');

        if (documentContainer) {
            console.log("🔄 Scrolling to document container...");
            documentContainer.scrollIntoView({ behavior: 'smooth', block: 'start' }); // ✅ Ensure the document is visible
        }
        
        if (element) {
            console.log(`🔄 Attempting to scroll to element with ID: ${id}`);
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('pop-highlight');

            setTimeout(() => {
                element.classList.remove('pop-highlight');
            }, 3000);
        } else {
            console.warn(`⚠️ Element with ID "${id}" not found. Retrying... (${retries} attempts left)`);
            retryScrollToHighlight(id, retries - 1); // 🔁 Retry after 500ms
        }
    }, 1000);
}


  // Run when the page loads
  onMount(() => {
      extractParams();

      // ✅ Manually check for URL changes every 500ms - added
      setInterval(() => {
            if (window.location.href !== lastUrl) {
                console.log("🔄 URL changed, extracting params again...");
                lastUrl = window.location.href;
                extractParams();
            }
        }, 500);
  });



    function annotateDocument(markdown, annotations) {
    let htmlContent = marked(markdown); // ✅ Use marked.parse() to convert Markdown first

    console.log("📜 Full Document BEFORE Annotation:", htmlContent.slice(0, 1000) + "..."); // Log first 1000 chars

    annotations.forEach(annotation => {
        if (!annotation.highlight || typeof annotation.highlight !== 'string' || annotation.highlight.trim() === "") {
            return;
        }

            // // ✅ Convert annotation text to HTML
            // const annotationHTML = marked(annotation.highlight).trim();

            // console.log(`🔍 Looking for: "${annotation.highlight}"`);
            // console.log(`🔹 Converted Annotation to HTML: "${annotationHTML}"`);

       

        //     if (!htmlContent.includes(annotationHTML)) {
        //     console.warn(`⚠️ WARNING: Text "${annotation.highlight}" NOT FOUND in document!`);
        // }



            // ✅ Escape regex special characters
        const escapedHighlight = annotation.highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // ✅ Escape regex special chars
        const regex = new RegExp(`(${escapedHighlight})`, 'gi');

           // ✅ Check if text exists in processed HTML
        if (!htmlContent.includes(annotation.highlight)) {
            console.warn(`⚠️ WARNING: Text "${annotation.highlight}" NOT FOUND in document!`);
        }

        htmlContent = htmlContent.replace(
            regex,
            (_, match) => `<span id="${annotation.id}" class="highlight highlight-block">${match}</span>`
        );
    });

    console.log("📜 Full Document AFTER Annotation:", htmlContent.slice(0, 1000) + "...");

    return htmlContent;
}

  
    // ✅ Scroll to a specific highlighted element
    function scrollToHighlight(id) {
        setTimeout(() => {
            let element = document.getElementById(id);
            if (element) {
                console.log(`🎯 Scrolling to highlight: ${id}`);
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('pop-highlight');
    
                setTimeout(() => {
                    element.classList.remove('pop-highlight');
                }, 3000);
            } else {
                console.warn(`⚠️ Element with ID "${id}" not found.`);

            // 🔁 Retry after 500ms if the element is still missing -added 
            setTimeout(() => {
                element = document.getElementById(id);
                if (element) {
                    console.log(`🎯 Scrolling to highlight (retry): ${id}`);
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    console.error(`❌ Highlight ID "${id}" STILL NOT FOUND after retry!`);
                }
            }, 500);
            }
    }, 500); //delay before searching for element 
    }

      // ✅ Toggle to show all examples
  function toggleViewAllExamples() {
      showAllAnnotations = !showAllAnnotations;
      annotatedDocument = showAllAnnotations
          ? annotateDocument(fullDocument, annotations)
          : marked(fullDocument);
  }
  </script>
  
  
  
  <h1>Document: {datasetId}</h1>
  
  <div class="example-document">
    {@html annotatedDocument}
  </div>
  

  <button on:click={toggleViewAllExamples}>
    {showAllAnnotations ? 'Hide All Examples' : 'View All Examples'}
</button>

<style>
/* Highlight class for annotations */
/* Pop effect for specific highlight */
:global(.pop-highlight) {
    animation: pop-animation 0.5s ease-in-out, fade-animation 3s forwards;
    box-shadow: 0 0 10px 5px rgba(255, 165, 0, 0.8); /* Glowing border */
    border-radius: 3px;
    background-color: orange !important; /* More prominent background color */
}

@keyframes pop-animation {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.1); /* Slightly enlarge the highlight */
    }
    100% {
        transform: scale(1);
    }
}

@keyframes fade-animation {
    0% {
        background-color: orange;
    }
    100% {
        background-color: yellow; /* Fade back to regular highlight */
    }
}


:global(.highlight) {
    background-color: yellow !important; /* Ensure visibility */
    color: black !important;             /* Text color */
    padding: 2px 4px;                    /* Tight padding */
    border-radius: 3px;                  /* Rounded corners */
    font-weight: bold;                   /* Bold emphasis */
    display: inline;                     /* Maintain inline behavior */
    line-height: normal;                 /* Reset line height */
    margin: 0;                           /* Remove unwanted margins */
    position: relative;                  /* Avoid conflicts */
    z-index: 1;                          /* Ensure highlight appears on top */
}


/* Special highlight styling for block-level elements in lists */
:global(.highlight-block) {
    display: inline-block; /* Block-like inline behavior */
    width: auto;           /* Ensure width matches text only */
    line-height: 1.2;      /* Match list item line height */
    position: relative;    /* Avoid any conflicts */
}

/* General container styling for the document */
.example-document {
    text-align: left !important; /* Force text alignment to the left */
    max-width: 800px;              /* Limit width for readability */
    margin: 0 auto;                /* Center the document container */
    padding: 20px;                 /* Inner spacing */
    background-color: #f9f9f9;     /* Subtle background color */
    border-radius: 8px;            /* Smooth rounded corners */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Add subtle shadow */
}

/* Left-align paragraphs and lists */
.example-document p,
.example-document ul,
.example-document ol {
    text-align: left !important;        /* Force left alignment */
    font-family: "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
    font-size: 16px;
    color: #555;             /* Subtle dark gray color */
    margin: 1em 0;           /* Space above and below elements */
}

.example-document h1,
.example-document h2,
.example-document h3 {
    text-align: center !important;
    font-family: "Georgia", serif;
    margin: 1em 0;
    color: #333;
}

.example-document ul,
.example-document ol {
    padding-left: 20px;
}


/* Custom tooltip styling */
:global(.highlight::after) {
    content: attr(data-title); /* Use the title attribute as tooltip content */
    position: absolute;
    bottom: 100%; /* Position above the highlighted text */
    left: 50%;
    transform: translateX(-50%);
    background-color: #333; /* Tooltip background color */
    color: #fff; /* Tooltip text color */
    padding: 5px 8px;
    border-radius: 4px;
    white-space: nowrap;
    font-size: 12px;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s ease-in-out;
    z-index: 10; /* Ensure it's above other elements */
}

/* Show the tooltip on hover */
:global(.highlight:hover::after) {
    opacity: 1;
    visibility: visible;
}

</style>

<div>
  <button on:click={toggleViewAllExamples}>
    {showAllAnnotations ? 'Hide All Examples' : 'View All Examples'}
  </button>
</div>




  