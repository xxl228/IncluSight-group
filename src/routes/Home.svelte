<script>
    import { navigate } from "svelte-routing";

    function goToDataset(datasetId) {
        console.log("Navigating to dataset:", datasetId);
        navigate(`/datasets/${datasetId}`);
    }
    // console.log("Home.svelte Loaded Successfully!"); // ADD THIS
</script>

<h1>Welcome to IncluSight</h1>
<p>
    IncluSight is an interactive tool that assesses the inclusivity of teaching practices within course syllabi. Using a Large Language Model (LLM), it 
    analyzes syllabi against the Inclusive Syllabus Inventory (ISI) and generates visualizations that highlight strengths and areas for improvement in fostering 
    inclusive learning environments. IncluSight provides personalized feedback to instructors who are committed to making their courses more inclusive.

    If you are interested in evaluating your syllabus, please contact Vivian Li at xxl228@psu.edu for more details.
</p>


<h2>Please select a course to explore the syllabi analysis further!</h2>
<!-- <p>Home is rendering!</p> ADD THIS -->

<!-- Dataset Selection Buttons -->
<div class="dataset-buttons">
    <button on:click={() => goToDataset("dataset1")}>View Course 1</button>
    <button on:click={() => goToDataset("dataset2")}>View Course 2</button>
    <button on:click={() => goToDataset("dataset3")}>View Course 3</button>
</div>

<p>
    You may select any of the course to begin explore syllabi analysis. If you would like to explore a different course, 
    please return to "Home" and refresh the page before selecting a different course. 
</p>


<style>
    h1 {
        text-align: left;
        font-size: 2em;
        color: #333;
        margin-bottom: 20px;
    }

    .dataset-buttons {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
    }

    button {
        font-size: 1.2em;
        padding: 10px 20px;
        background-color: #007BFF;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background 0.3s ease-in-out;
    }

    button:hover {
        background-color: #0056b3;
    }
</style>
