/*
https://www.facebook.com/pg/DeveloperCircles/groups/
*/
var lst = [];
for (const group of $$('._3lkd')) {
  const _ = group.querySelector('._266w a');
  const name = _.innerText;
  const id = _.getAttribute('data-hovercard').split("?id=")[1].split("&")[0];
  const isPublic = group.querySelector('._2fxm').innerText === 'Public group';
  if (isPublic) lst.push(id);
}
console.log(lst);
