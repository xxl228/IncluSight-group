<script>
    import { Router, Route, Link } from "svelte-routing";
    import Home from "./routes/Home.svelte";
    import DatasetPage from "./routes/DatasetPage.svelte";

    // console.log("✅ App.svelte is running!"); // Debugging output
</script>

<main>
    <!-- <h1>Sunburst Chart Example</h1> -->
	
	<!-- {#if true}
  		<p>App.svelte Loaded Successfully!</p>
	{/if} -->

    <Router>
        <nav>
            <Link to="/">Home</Link>
            <Link to="/datasets/dataset1">Dataset 1</Link>
            <Link to="/datasets/dataset2">Dataset 2</Link>
            <Link to="/datasets/dataset3">Dataset 3</Link>
        </nav>

        <Route path="/" component={Home} />
        <Route path="/datasets/:datasetId" component={DatasetPage} />
        <Route path="/document" component={Document} />  <!-- ✅ Ensure this exists -->
    </Router>
</main>

<style>
    main {
        text-align: center;
        padding: 1em;
        max-width: 960px;
        margin: 0 auto;
    }

    h1 {
        color: #333;
        font-size: 2em;
    }

    nav {
        display: flex;
        justify-content: center;
        gap: 1em;
        margin-bottom: 1em;
    }

    a {
        text-decoration: none;
        color: blue;
    }
</style>
