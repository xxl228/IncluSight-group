<script>
  import { onMount } from 'svelte';
  import { marked } from 'marked';
  // import { get } from "svelte/store";
  // import { location } from 'svelte-routing';
  // import { page } from '$app/stores';
  // import { useParams } from 'svelte-routing';
  import { fullDocument } from "../data/fullDocument";
  import { annotations } from "../data/documentAnnotations";

 
  export let datasetId;
  let annotatedDocument = ''; // Will store the document with highlights
  let showAllAnnotations = false; // Toggle to show all highlights

  let highlightId = ''; // Stores the highlight ID from URL

    // // Get dataset ID from the URL
    // $: datasetId = get(useParams()).id;
    //  // Svelte store: auto-updates when URL changes
    // $: console.log("Current URL:", $location);

    // Prepare the document with highlights on mount
    onMount(async () => {
        // Step 1: Extract dataset ID at the beginning
        let path = window.location.pathname;
        datasetId = path.split('/').pop(); // Extract dataset1, dataset2, etc.

        console.log('Document Loaded - Extracted Dataset ID:', datasetId);


      //Preserve navigation state within dataset
      history.replaceState({ from: `/document/${datasetId}` }, ""); 
        //  Check for navigation state
        const previousState = history.state?.from;
        if (previousState) {
            console.log(`Navigated from: ${previousState}`);
        }


  
    // Annotate the document
          annotatedDocument = annotateDocument(fullDocument, annotations);

    // Wait for DOM to render
          setTimeout(() => {

              // Parse the URL for highlight ID
              const params = new URLSearchParams(window.location.search);
              const highlightAll = params.get('all') === 'true'; // Check if all=true is in the URL
              const highlightId = params.get('id'); // Support query or hash

  //   console.log('Extracted Highlight ID:', highlightId); // Debug extracted ID

  //   if (highlightId) {
  //       highlightElement(highlightId);
  //   }
                if (highlightAll) {
                          console.log('Highlighting all examples');
                          setTimeout(() => highlightAllExamples(), 100);
                      }
        
                    // Scroll to a specific highlight if `id` is provided
                if (highlightId) {
                  console.log(`Scrolling to highlight ID: ${highlightId}`);
                  setTimeout(() => scrollToHighlight(highlightId), 100);
                }
              });
  });


  // Function to annotate the full document
  function annotateDocument(markdown, annotations) {

     // Convert Markdown to raw HTML
     let htmlContent = marked(markdown);

    annotations.forEach(annotation => {
      // console.log("🔍 Checking annotation:", annotation);
      
      // if (!annotation.highlight || !annotation.id) {
      //   console.warn(`Annotation skipped: ${annotation}`);
      //   console.warn(`Skipping annotation:`, annotation);
      //   return;
      // }

          // ✅ Skip if `highlight` is missing or empty
        if (!annotation.highlight || typeof annotation.highlight !== 'string' || annotation.highlight.trim() === "") {
            console.warn(`⚠️ Skipping annotation due to invalid highlight text:`, annotation);
            return;
        }

              // ✅ Convert annotation text to HTML
                const annotationHTML = marked(annotation.highlight).trim();

              console.log(`🔍 Looking for: "${annotation.highlight}"`);
              console.log(`🔹 Converted Annotation to HTML: "${annotationHTML}"`);

              // ✅ Check if converted text exists in processed HTML
              if (!htmlContent.includes(annotationHTML)) {
                  console.warn(`⚠️ WARNING: Converted text "${annotationHTML}" NOT FOUND in document!`);
                  
                  // ✅ Try checking the raw Markdown before it was converted
                  if (markdown.includes(annotation.highlight)) {
                      console.log(`✅ Text exists in raw Markdown but NOT in processed HTML.`);
                  } else {
                      console.error(`❌ Text does NOT exist even in Markdown! Check documentAnnotations.js.`);
                  }
              }


        

      // Escape special characters for regex (to avoid issues with certain characters)
        const escapedHighlight = annotation.highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedHighlight})`, 'gi');

        htmlContent = htmlContent.replace(
            regex,
            `<span id="${annotation.id}" class="highlight highlight-block" title="${annotation.annotation}" >$1</span>`  //
        );

    });

    console.log("📜 Full Document AFTER Annotation:", htmlContent.slice(0, 500) + "...");

    return htmlContent;
  }



  // Scroll to a specific highlighted element
  function scrollToHighlight(id) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('pop-highlight');

          // Remove the "pop" effect after a short delay
       setTimeout(() => {
        element.classList.remove('pop-highlight');
        }, 3000); // Adjust duration as needed
      } else {
        console.warn(`Element with ID "${id}" not found.`);
    // } else {
    //   console.warn(`Element with ID "${id}" not found.`);
    }
  }

	// Function to highlight all examples (keep the highlight)
	function highlightAllExamples() {
		annotations.forEach(annotation => {
			const element = document.querySelector(`#${annotation.id}`);
      console.log(`Querying for ID: ${annotation.id}, Found:`, element);
			if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
				element.classList.add('highlight'); // Add the highlight class
			} else {
				console.warn(`Element with ID "${annotation.id}" not found.`);
			}
		});
	}

  // Toggle to show all examples
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



