// Copyright (c) 2014 Ola Holmström <olaholmstrom+github@gmail.com>

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

var parents = function (node, ps) {
  if (node.parentNode === null) { return ps; }

  return parents(node.parentNode, ps.concat([node]));
};

var style = function (node, prop) {
  return getComputedStyle(node, null).getPropertyValue(prop);
};

var overflow = function (node) {
  return style(node, "overflow") + style(node, "overflow-y") + style(node, "overflow-x");
};

var scroll = function (node) {
 return (/(auto|scroll)/).test(overflow(node));
};

export default function (node) {
  if (!(node instanceof HTMLElement)) {
    return ;
  }

  var ps = parents(node.parentNode, []);

  for (var i = 0; i < ps.length; i += 1) {
    if (scroll(ps[i])) {
      return ps[i];
    }
  }

  return window;
};
