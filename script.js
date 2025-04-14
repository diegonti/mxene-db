let database;

// Load JSON data
fetch('database.json')
    .then(response => response.json())
    .then(data => {
        database = data;
        populateFilters(database);
    })    .catch(error => console.error('Error loading JSON:', error));


function searchMXene() {
    const query = document.getElementById('searchInput').value.toLowerCase();

    let matchingMxenes;

    if (query) {
        // Search by name if query is present
        matchingMxenes = database.filter(m =>
            m.full_name.toLowerCase() === query || m.name.toLowerCase() === query
        );
    } else {
        // Otherwise search by filters
        const filter_n = document.getElementById('filter_n').value;
        const filter_M = document.getElementById('filter_M').value;
        const filter_X = document.getElementById('filter_X').value;
        const filter_T = document.getElementById('filter_T').value;
        const filter_stack = document.getElementById('filter_stack').value;
        const filter_hollow = document.getElementById('filter_hollow').value;

        matchingMxenes = database.filter(m => {
            const nMatch = !filter_n || m.n == filter_n;
            const MMatch = !filter_M || m.M_label === filter_M;
            const XMatch = !filter_X || m.X_label === filter_X;
            const TMatch = !filter_T || (filter_T === 'None' ? m.T_label === null : m.T_label === filter_T);
            const stackMatch = !filter_stack || m.stack_label === filter_stack;
            const hollowMatch = !filter_hollow || (filter_hollow === 'None' ? m.hollow_label === null : m.hollow_label === filter_hollow);

            return nMatch && MMatch && XMatch && TMatch && stackMatch && hollowMatch;
        });
    }

    displayResults(matchingMxenes);

}


function displayResults(matchingMxenes) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';
    
    if (matchingMxenes.length > 0) {
        // Display all matching MXenes
        matchingMxenes.forEach(mxene => {
            const mxeneDiv = document.createElement('div');
            let mxeneType = mxene.IsGap === 0 ? "Metallic" : "Semiconductor";
            let mxene_sub_name = mxene.name.replace(/\d+/g, match => `<sub>${match}</sub>`);
            let hollow_sub = mxene.hollow_label === null ? "" : mxene.hollow_label.replace(/[MX]/g, match => `<sub>${match}</sub>`);
            let relEnergyTitle = hollow_sub === "" ? "Relative Energy with respect to the ABC stacking" : "Relative Energy with respect to the ABC HM structure";
            let relEnergyLabel = hollow_sub === "" ? "&Delta;E<sub>ABC</sub>" : "&Delta;E<sub>ABC HM</sub>";
            let download_path = mxene.hollow_label === null ? `contcars/pristine/searcher_${mxene.n}_p/${mxene.stack_label}/CONTCAR_${mxene.name}` : `contcars/terminated/searcher_${mxene.n}_${mxene.T_label}/${mxene.stack_label}_${mxene.hollow_label}/CONTCAR_${mxene.name}`
            let download_name = mxene.hollow_label === null ? `CONTCAR_${mxene.name}_${mxene.stack_label}` : `CONTCAR_${mxene.name}_${mxene.stack_label}_${mxene.hollow_label}`
            // <a href="contcars/terminated/searcher_${mxene.n}_${mxene.T_label}/${mxene.stack_label}_${mxene.hollow_label}/CONTCAR_${mxene.name}" download="CONTCAR_${mxene.name}_${mxene.stack_label}_${mxene.hollow_label}">Download CONTCAR</a>

            mxeneDiv.innerHTML = `
                <h2>${mxene_sub_name} ${mxene.stack_label} ${hollow_sub}</h2>

                <p class="mxene-type"> ${mxeneType} </p>

                <div class="flex-container">

                    <p class="outer-box" title="Lattice parameter">
                        <span class="label-box"><i style="font-family: 'Parisienne' ">a</i></span>
                        <span class="result-box">${mxene.a.toFixed(3)} &#8491;</span>
                    </p>
                    <p class="outer-box" title="MXene width">
                        <span class="label-box"><i style="font-family: 'Parisienne' ">d</i>
                        </span><span class="result-box">${mxene.d.toFixed(3)} &#8491;</span>
                    </p>
                    <p class="outer-box" title="PBE0 Bandgap">
                        <span class="label-box">E<sub>g</sub><sup>PBE</sup></span>
                        <span class="result-box">${mxene.Eg_PBE.toFixed(3)} eV</span>
                    </p>
                    <p class="outer-box" title="PBE0 Bandgap">
                        <span class="label-box">E<sub>g</sub><sup>PBE0</sup></span>
                        <span class="result-box">${mxene.Eg_PBE0.toFixed(3)} eV</span>
                    </p>
                    <p class="outer-box" title="${relEnergyTitle}">
                        <span class="label-box">${relEnergyLabel}</span>
                        <span class="result-box">${mxene.e_rel} eV</span>
                    </p>

                </div>

                <br>
                <a href="${download_path}" download="${download_name}">Download CONTCAR</a>
                
                <hr>
            `;
            resultDiv.appendChild(mxeneDiv);
        });
    } else {
        resultDiv.innerHTML = '<p class="not-found">No results found</p>';
    }
}


function searchOnEnter(event) {
    if (event.key === 'Enter') {
        searchMXene();
    }
}

function populateFilters(data) {
    // const uniqueValues = (key) => [...new Set(data.map(item => item[key]).filter(Boolean))].sort();
    const uniqueValues = (key) => {
        const values = data.map(item => item[key] === null ? 'None' : item[key]);
        return [...new Set(values)].sort();
    };

    const addOptions = (selectId, values) => {
        const select = document.getElementById(selectId);
        values.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    };

    addOptions('filter_n', uniqueValues('n'));
    addOptions('filter_M', uniqueValues('M_label'));
    addOptions('filter_X', uniqueValues('X_label'));
    addOptions('filter_T', uniqueValues('T_label'));
    addOptions('filter_stack', uniqueValues('stack_label'));
    addOptions('filter_hollow', uniqueValues('hollow_label'));
}


function toggleFilters() {
    const filterContainer = document.getElementById("filterContainer");
    const icon = document.getElementById("filterIcon");
    const searchInput = document.getElementById('searchInput');
  
    // Clear the input box when the filter icon is pressed
    searchInput.value = '';
  
    // Toggle the visibility of the filter options
    const isVisible = filterContainer.style.display === "flex"; // Check if it's already visible
    filterContainer.style.display = isVisible ? "none" : "flex"; // Toggle between flex and none
  
    // Toggle the icon based on the visibility of the filter options
    icon.classList.remove("fa-filter", "fa-filter-circle-xmark");
    icon.classList.add(isVisible ? "fa-filter" : "fa-filter-circle-xmark");

    // Change the placeholder text based on filter visibility
    if (isVisible) {
        // If filters are hidden, revert the placeholder to the original
        searchInput.placeholder = "Enter MXene (e.g. Zr2CO2 or Zr2CO2_ABC_HM)";
    } else {
        // If filters are visible, change the placeholder text
        searchInput.placeholder = "Filter MXenes by composition and structure";
    }
}

  
  
  
  
  