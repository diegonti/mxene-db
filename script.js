let database;

// Load JSON data
fetch('database.json')
    .then(response => response.json())
    .then(data => database = data)
    .catch(error => console.error('Error loading JSON:', error));

function searchMXene() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';

    // Filter all MXenes that match the query
    // const matchingMxenes = database.filter(m => m.name.toLowerCase() === query || m.composition.toLowerCase() === query);
    const matchingMxenes = database.filter(m => m.full_name.toLowerCase() === query || m.name.toLowerCase() === query);

    
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

