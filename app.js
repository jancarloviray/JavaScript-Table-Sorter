//by Jan Carlo Viray
//experimenting on sort without plugins or libraries..

/*
LESSONS:
- data-headIndex (in JS) ==> data-headindex (in HTML)
- cloneNode(true | false) //param: deep node
- node elements are added as pointers to ACTUAL html in page, unless cloneNode is used.
- getAttribute converts to string; use +(...getAttribute(..)) to typeconvert to number

*/

/*
TODO
- decouple sorter function; THINK pluggability.
- icon on header
- different kinds of sorting mechanism...
- cleanup code
- cross-browser
- apply best practices here...
- organize code: modules, ... etc
- try... drag columns to reposition
- see performance on hundreds of data.
*/

var tbl = document.getElementById('main-table'),
    currentIndex = 0;

function setupHeader(){
  var headerCells = tbl.tHead.rows[0].cells;
  
  function init(){
    addAttributesAndEvents();
  }
  
  function addAttributesAndEvents(){
    for( var i = 0; i < headerCells.length; i++ ) {
      headerCells[i].setAttribute('data-index',i);
      headerCells[i].setAttribute('data-sort-order','undefined');
      headerCells[i].addEventListener('click',sortMe);
    }
  }
  
  function sortMe(evt){
    currentIndex = +evt.target.getAttribute('data-index');
    console.log('currentIndex: ', currentIndex);

    // change asc | desc
    if( evt.target.getAttribute('data-sort-order') == 'undefined' ) {
      evt.target.setAttribute('data-sort-order','asc');
      evt.target.className = 'header-ascending';
    } else if ( evt.target.getAttribute('data-sort-order') == 'asc' ) {
      evt.target.setAttribute('data-sort-order','desc');
      evt.target.className = 'header-descending';
    } else {
      evt.target.setAttribute('data-sort-order','asc');
      evt.target.className = 'header-ascending';
    }
    
    sortColumn(evt.target).init();
    
  }
  
  return {
    init : init
  };
  
}

function sortColumn(target){
  
  var currentColumn = [],
      totalTableRows;
  
  
  function init(){
    totalTableRows = tbl.tBodies[0].rows.length;
    populateCurrentColumn();
    
    //sort currentColumn within the array (pluggable sort)
    sortCurrentColumn();
    
    //replace node element to reflect currentColumn array incl order
    replaceActualTable();
    
    tempCol = currentColumn;
  }
  
  // get text and replace using text (fast, works only on txt, evts removed)
  // OR 
  // get node and replace using node (perf issues (?))
  
  function populateCurrentColumn(){
    for( var i = 0; i < totalTableRows; i++ ){
      var x = tbl.tBodies[0].rows[i].cells[currentIndex];
      //currentColumn.push(x);
      currentColumn.push(x.cloneNode(true));
    }
  }
  
  function sortCurrentColumn(){
    currentColumn.sort(sorter);
  }
  
  function sorter(a,b){
    var aText = a.textContent || a.innerText, 
      bText = b.textContent || b.innerText;
    
    if (target.getAttribute('data-sort-order')=='desc'){
      return aText + bText;
    } else if ( target.getAttribute('data-sort-order')=='asc' ){
      return aText - bText;
    }
    
  }
  
  function replaceActualTable(){
    for( var i = 0; i < totalTableRows; i++ ){
      var oldCell = tbl.tBodies[0].rows[i].cells[currentIndex];
      var newCell = currentColumn[i];
      console.log(newCell, oldCell);
      oldCell.parentNode.replaceChild(newCell, oldCell);
      
    }
  }
  
  return {
    init : init
  };
}

setupHeader().init();

//replaceChild caused a HUGE bug, that involves .cloneNode!
//NOTE: important! when you're trying to copy node elements into a temporary
//array such as in this case, it doesn't just do a 'copy-paste', but instead
//it copies a pointer!!! so, trying to tempArray.push(node-elem) is actually
//pushing a pointer.. not a node.. this can bring a lot of trouble..
//first, see that in Chrome's console.. if you hover your mouse over the 
//elements in tempArray.. it will highlight it on the PAGE!
//what does this mean? it means that they are pointers!!!
//which is why the entire replaceChild stuff didn't work....
//SOLUTION. use tempArray.push(nodeElem.cloneNode(true))!!!