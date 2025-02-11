<script>
    // import { onMount } from 'svelte';
    import { onMount } from 'svelte';
    // import { get } from 'svelte/store';
    // import { location } from "svelte-routing";
    import { navigate } from 'svelte-routing';
    
    // export let datasetId;
    export let datasetId;
    export let data;
    export let zoomLevel=0;
    

    // let datasetId = '';
    let ones = [];
    let zeros = [];
  

    console.log("Details.svelte is loaded");


    // Extract dataset ID from the URL dynamically
    // onMount(() => {
    //     // Extract dataset ID dynamically from the URL
    //     if (!datasetId || datasetId === "undefined") {
    //         let path = window.location.pathname;
    //         datasetId = path.split('/').pop(); // Extract dataset1, dataset2, etc.
    //         console.log("Details Loaded - Extracted Dataset ID:", datasetId);
    //     } else {
    //         console.log("✅ Details already initialized with datasetId:", datasetId);
    //     }
    // });
//     onMount(() => {
        
//     if (!datasetId || datasetId === "undefined") {
//         let path = window.location.pathname;
//         let extractedId = path.split('/').pop();
        
//         if (datasetId !== extractedId) {
//             datasetId = extractedId;
//             console.log(`🚀 Details.svelte MOUNTED - datasetId: ${datasetId} - Instance ID: ${Math.random()}`);
//         }
//     } else {
//         console.log("✅ Details already initialized with datasetId:", datasetId);
//     }
// });
        onMount(() => {
            if (!datasetId || datasetId === "undefined") {
                let path = window.location.pathname;
                let extractedId = path.split('/').pop();
                
                if (extractedId && extractedId !== "undefined") {
                    datasetId = extractedId;
                    console.log(`🚀 Details.svelte MOUNTED - Extracted datasetId: ${datasetId} - Instance ID: ${Math.random()}`);
                } else {
                    console.warn("⚠️ Details.svelte mounted with an invalid datasetId. Skipping initialization.");
                }
            } else {
                console.log(`✅ Details already initialized with datasetId: ${datasetId}`);
            }
        });


    // Reactively update `ones` and `zeros` when data changes
    $: if (data?.children) {
        console.log("🔄 Data Updated in Details.svelte:", data);
        ones = [];
        zeros = [];
        gatherLeafNodes(data.children);
        console.log("Zeros Array:", zeros); // Add this line
    }
//     $: if (datasetId && data?.children && ones.length === 0 && zeros.length === 0) {
//     console.log(`🔄 Processing dataset: ${datasetId}`);
//     ones = [];
//     zeros = [];
//     gatherLeafNodes(data.children);
//     console.log("✅ Processed dataset:", datasetId, "Zeros Array:", zeros);
// }



        // Recursive function to gather leaf nodes
    function gatherLeafNodes(nodes) {
        nodes.forEach(subcat => {
            if (subcat.children) {
                gatherLeafNodes(subcat.children);
            } else if (subcat.Value !== undefined) {
                if (subcat.Value === 1) {
                    ones.push(subcat);
                } else if (subcat.Value === 0) {
                    zeros.push(subcat);
                }
            }
        });
    }

    // function viewExample(id, event) {
    //     event.preventDefault(); // ✅ Prevent default <a> behavior
    //     console.log(`🖱️ Navigating to /document?id=${id}`);
    //    // ✅ Use `navigate()` properly for query params
    //    navigate(`/document/${datasetId}?id=${id}`); // ✅ Ensure datasetId is included

    //     setTimeout(() => {
    //     window.location.href = `/document?id=${id}`; // ✅ Force full reload if needed
    // }, 100);
//   }

function viewExample(id, event) {
    event.preventDefault(); // ✅ Prevent default <a> behavior
    console.log(`🎯 Scrolling to highlight: ${id}`);

    let documentContainer = document.querySelector('.example-document'); // Ensure the document is in view
    let element = document.getElementById(id);

    if (documentContainer) {
        documentContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    setTimeout(() => {
        if (element) {
            console.log(`🎯 Scrolling to highlighted element: ${id}`);
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Add highlight effect
            element.classList.add('pop-highlight');
            setTimeout(() => element.classList.remove('pop-highlight'), 3000);
        } else {
            console.warn(`⚠️ Highlighted element with ID "${id}" not found!`);
        }
    }, 500); // Allow time for document to scroll into view
}


    console.log("🚀 Details.svelte mounted - datasetId:", datasetId);
    $: console.log("🔄 Data changed:", data);
</script>

<div>
    <div class="details-section">
        <!-- {#if !data && zoomLevel === 0} -->
        <!-- {#if (!data || Object.keys(data).length === 0) && zoomLevel === 0} -->
        <!-- {#if (!data || (data.children && data.children.length === 0)) && zoomLevel === 0 && datasetId && ones.length === 0 && zeros.length === 0} -->
        {#if (!data || !data.children || data.children.length === 0) && zoomLevel === 0 && datasetId && ones.length === 0 && zeros.length === 0}
          <!-- Show intro text on the highest level -->
          <div class="intro-text">
            <h3>Syllabus analysis is ready! Please click on any category to explore more in details.</h3>
          </div>
        {:else}
          <!-- Show category details when zoomed in -->
          {#if data?.name}
            <h2>{data.name}</h2>

            <!-- Display items grouped by Value -->
            <h3>Inclusive Teaching Practices Found in Current Syllabus</h3>
            <ul>
                {#each ones as item}
                    <li><strong>{item.name}</strong>: {item.SpecificsExplained}
                    <!-- <a href={`/document?id=${item.id}`} class="view-example"  on:click={() => console.log('Navigating to:', `/document?id=${item.id}`)}>View Example</a> -->
                    <a
                        href="#"
                        class="view-example"
                        on:click={(e) => viewExample(item.id, e)}>
                        View Example
                  </a>
                </li>
              {/each}
            </ul>

            <h3>Inclusive Elements Could Be Included in Current Syllabus</h3>
            <ul>
                {#each zeros as item}
                        <li>
                            <strong>{item.name}</strong>: {item.SpecificsExplained} 
                            <a
                                href="#"
                                class="view-example"
                                on:click={(e) => viewExample(item.id, e)}>
                                View Example
                          </a>
                        </li>
                {/each}
            </ul>
          {/if}
        {/if}
    </div>
</div>

<!-- <button on:click={() => navigate('/document')} class="view-all-btn">
    View All Examples
</button> -->

<!-- <button on:click={() => {
    console.log('Navigating to /document?all=true');
    navigate(`/document?all=true`)
}} class="view-all-btn">
    View All Examples
</button> -->

<style>
    /* Style adjustments for better readability */
    .details-section {
        margin-top: 20px;
        padding: 10px;
        border-top: 1px solid #ddd;
    }

    .intro-text {
        text-align: left;
        font-size: 1rem;
        color: #444;
        background-color: #f9f9f9;
        padding: 15px;
        border-radius: 8px;
        border: 1px solid #ccc;
    }

    .intro-text h2 {
        font-size: 1.4rem;
        margin: 0 0 10px 0;
    }

    .intro-text p {
        margin: 0;
    }
    h2 {
        color: #333;
        margin-bottom: 10px;
        text-align: left;
    }

    h3 {
        color: #555;
        margin-top: 20px;
        text-align: left;
    }

    ul {
        list-style-type: disc;
        padding-left: 20px;
        text-align: left;
    }

    li {
        margin: 5px 0;
        padding-bottom: 5px;
    }

    .view-example {
        margin-left: 10px;
        color: #add8e6;
        text-decoration: underline;
        cursor: pointer;
    }
</style>
