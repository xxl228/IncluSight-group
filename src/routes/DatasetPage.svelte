<script>
    import { onMount } from "svelte";
    import SunburstChart from "../components/SunburstChart2.svelte";
    import Details from "../components/Details.svelte";
    // import Document from "./Document1.svelte";
    import Document from "./Document.svelte";

    export let datasetId; // Ensure datasetId is correctly passed from the route
    let data = null;  //  Initialize data
    let zoomLevel = 0;  //  Initialize zoomLevel

    console.log("DatasetPage Loaded - datasetId:", datasetId);

    onMount(() => {
        // Debugging: Ensure datasetId is correctly set
        if (!datasetId) {
            let path = window.location.pathname;
            datasetId = path.split("/").pop(); // Extract dataset1, dataset2, dataset3
            console.log("Extracted Dataset ID from Path:", datasetId);
        }
        if (!datasetId) {
            console.error("❌ datasetId is still undefined!");
        }
    });

      // Define a mapping from dataset IDs to Course numbers
  const datasetMapping = {
    dataset1: "Course 1",
    dataset2: "Course 2",
    dataset3: "Course 3",
    dataset4: "Course 4",
  };

  // Resolve dataset name
  const courseName = datasetMapping[datasetId] || `No Course Information Available`;

</script>


<h1>{courseName}</h1>


<!-- <h1>Course Information: {datasetId || "No Dataset ID Found"}</h1> -->

<!-- Load visualization and details dynamically -->
<!-- {#if datasetId && datasetId != 'undefined' && datasetId !== null}
    <SunburstChart {datasetId} />
    <Details {datasetId} {data} {zoomLevel}/>
    <Document {datasetId} />
{:else}
    <p>Error: No dataset ID provided.</p>
{/if} -->

{#if datasetId && datasetId !== "undefined"}
    <SunburstChart {datasetId} />

    <!-- Only render Details.svelte when data is available -->
    {#if data !== null}
        <Details {datasetId} {data} {zoomLevel} />
    {/if}

    <Document {datasetId} />
{/if}


<style>
    h1 {
        text-align: center;
        font-size: 1.8em;
        color: #333;
    }

    p {
        text-align: center;
        font-size: 1.2em;
        color: red;
    }
</style>
