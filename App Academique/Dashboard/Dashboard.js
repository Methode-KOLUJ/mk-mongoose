async function fetchScores(e){try{var t=await(await fetch(`/get-scores?username=${e}&Titre=`+e)).json();updateTable(t),updateCharts(t)}catch(e){console.error("Error fetching scores:",e)}}function updateTable(e){let r=document.querySelector("#resultsTable tbody");r.innerHTML="",e.forEach(e=>{var t=document.createElement("tr");t.innerHTML=`
      <td>${e.username}</td>
      <td>${e.Titre}</td>
      <td>${e.score}</td>
      <td>${e.progressPercentage}</td>
      <td>${e.submissionDate}</td>
      <td>${e.submissionTime}</td>
    `,r.appendChild(t)})}function updateCharts(e){var t=document.getElementById("lineChart").getContext("2d"),r=document.getElementById("pieChart").getContext("2d"),a=e.map(e=>e.Titre),e=e.map(e=>e.score);new Chart(t,{type:"line",data:{labels:a,datasets:[{label:"Scores",data:e,borderColor:"rgba(75, 192, 192, 1)",borderWidth:2,fill:!1}]},options:{responsive:!0,scales:{x:{display:!0},y:{display:!0}}}}),new Chart(r,{type:"pie",data:{labels:a,datasets:[{label:"Scores",data:e,backgroundColor:["rgba(255, 99, 132, 0.2)","rgba(54, 162, 235, 0.2)","rgba(255, 206, 86, 0.2)","rgba(75, 192, 192, 0.2)","rgba(153, 102, 255, 0.2)","rgba(255, 159, 64, 0.2)"],borderColor:["rgba(255, 99, 132, 1)","rgba(54, 162, 235, 1)","rgba(255, 206, 86, 1)","rgba(75, 192, 192, 1)","rgba(153, 102, 255, 1)","rgba(255, 159, 64, 1)"],borderWidth:1}]},options:{responsive:!0}})}document.getElementById("searchButton").addEventListener("click",()=>{var e=document.getElementById("searchInput").value.trim();e&&fetchScores(e)});