document.addEventListener("DOMContentLoaded", function(){


    const searchButton =document.getElementById("search-btn");
    const usernameInput = document.getElementById("user-input");
    const statsContainer = document.querySelector(".stast-container");
    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle= document.querySelector(".hard-progress");
    const easyLable=document.getElementById("easy-lable");
    const mediumLable=document.getElementById("medium-lable");
    const hardLable=document.getElementById("hard-lable");
    const cardStatsContainer=document.querySelector(".stats-card")

    // return true or false based on aregex for matching username 

    function validateusername(username){
        if(username.trim()===""){
            alert("user should not be empty");
            return false;
        }
        const regex= /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/;
        const isMatching =regex.test(username);
        if(!isMatching){
            alert("invalid username");
        }
        return isMatching;
    }

    async function fetchUserDetails(username) {
        
        try{
            searchButton.textContent="searching...";
            searchButton.disabled=true;

            const proxyurl ='https://cors-anywhere.herokuapp.com/';
            const url='https://leetcode.com/graphql/';
            // concatenated url:https://cors-anywhere.herokuapp.com/https://leetcode.com/graphql/
            const myHeader = new Headers();
            myHeader.append("content-type", "application/json")

            const graphql = JSON.stringify({
                  query: `
                       query userSessionProgress($username: String!) {
                          allQuestionsCount {
                            difficulty
                            count
                        }

                        matchedUser(username: $username) {
                          submitStats {
                          acSubmissionNum {
                          difficulty
                          count
                          submissions
                        }

                        totalSubmissionNum {
                          difficulty
                          count
                          submissions
                       }
                   }
                 }
               }`,
                variables: {"username": `${username}`}
            })
            const requestOption={
            method:"post",
            headers:myHeader,
            body:graphql,
            redirect:"follow"
            };

            const response = await fetch(proxyurl+url,requestOption);
            if(!response.ok){
                throw new Error("unable to fetch te user details ");
            }
            const parseddata = await response.json();
            console.log("logging data:", parseddata);
            
            displayUserData(parseddata);
        }
        catch(error){
            statsContainer.innerHTML=`<p>${error.message}</p>`
        }
        finally{
            searchButton.textContent="search";
            searchButton.disabled=false;
        }
    }

    function updateProgress(solved, total, lable, circle){
        const progressDegree=(solved/total)*100;
        circle.style.setProperty("--progress-degree", `${progressDegree}%`);
        lable.textContent=`${solved}/${total}`;
    }

    function displayUserData(parseddata){
        const totalQues=parseddata.data.allQuestionsCount[0].count;
        const totalEasyQues=parseddata.data.allQuestionsCount[1].count;
        const totalMediumQues=parseddata.data.allQuestionsCount[2].count;
        const totalHardQues=parseddata.data.allQuestionsCount[3].count;

        const SolvedtotalQues=parseddata.data.matchedUser.submitStats.acSubmissionNum[0].count;
        const SolvedtotalEasyQues=parseddata.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const SolvedtotalMediumQues=parseddata.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const SolvedtotalHardQues=parseddata.data.matchedUser.submitStats.acSubmissionNum[3].count;
        
        updateProgress(SolvedtotalEasyQues, totalEasyQues, easyLable, easyProgressCircle);
        updateProgress(SolvedtotalMediumQues, totalMediumQues, mediumLable, mediumProgressCircle);
        updateProgress(SolvedtotalHardQues, totalHardQues, hardLable, hardProgressCircle);

        const cardData=[
            {lable:"Overall Submissions", value:parseddata.data.matchedUser.submitStats.totalSubmissionNum[0].submissions},
            {lable:"Overall Easy Submissions", value:parseddata.data.matchedUser.submitStats.totalSubmissionNum[1].submissions},
            {lable:"Overall Medium Submissions", value:parseddata.data.matchedUser.submitStats.totalSubmissionNum[2].submissions},
            {lable:"Overall Hard Submissions", value:parseddata.data.matchedUser.submitStats.totalSubmissionNum[3].submissions},
        ];
        console.log("card ka data:",cardData);

        cardStatsContainer.innerHTML=cardData.map(
            data=>{
                return `
                  <div class="card">
                     <h4>${data.lable}</h4>
                     <p>${data.value}</p>
                  </div>
                `
            }
        ).join("")
    }

    searchButton.addEventListener('click', function(){
        const username=usernameInput.value;
        console.log("logging user name:" +username);
        if(validateusername(username)){
            fetchUserDetails(username);
        }
    })
})