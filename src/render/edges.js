import * as d3 from "d3";
import { itemTagged, itemSelected } from "./helpers";
import { css_classes } from "./options";
import * as events from "./events";

/**
 * 绘制边
 * @param {Object} container - D3选择器容器
 * @param {Object} edge - 边对象
 * @param {Object} transition - D3过渡对象
 * @returns {Object} 返回phylotree实例
 */
export function drawEdge(container, edge, transition) {

  container = d3.select(container);

  // 计算边的线条粗细
  let strokeWidth = this.getEdgeStrokeWidth(edge);

  container = container
    .attr("class", d => {
      return this.reclassEdge(d);
    })
    .style("stroke-width", strokeWidth + "px")
    .on("click", d => {
      this.modifySelection([edge.target], this.selection_attribute_name);
      this.update();
    });

  let new_branch_path = this.draw_branch([edge.source, edge.target]);

  if (transition) {

    if (container.datum().existing_path) {
      container = container.attr("d", function(d) {
        return d.existing_path;
      });
    }

    container = container.attr("d", new_branch_path);

  } else {
    container = container.attr("d", new_branch_path);
  }

  edge.existing_path = new_branch_path;

  var bl = this.phylotree.branch_length_accessor(edge.target);

  if (bl !== undefined) {
    var haz_title = container.selectAll("title");

    if (haz_title.empty()) {
      haz_title = container.append("title");
    }
    haz_title.text("Length = " + bl);
  } else {
    container.selectAll("title").remove();
  }

  if (this.edge_styler) {
    this.edge_styler(container, edge, transition);
  }

  return this.phylotree;

}

/**
 * 重新分类边的CSS类
 * @param {Object} edge - 边对象
 * @returns {String} 返回边的CSS类字符串
 */
export function reclassEdge(edge) {

  let class_var = css_classes["branch"];

  if (itemTagged(edge)) {
    class_var += " " + css_classes["tagged-branch"];
  }

  if (itemSelected(edge, this.selection_attribute_name)) {
    class_var += " " + css_classes["selected-branch"];
  }

  // 检查是否为主分支边
  if (this.options["bold-main-branch"] && this.isMainBranchNode && this.isMainBranchNode(edge.target)) {
    class_var += " " + css_classes["main-branch"];
  }

  return class_var;

}

export function initializeEdgeLabels() {

  this.links.forEach(d => {

    // TODO: Move away from storing attribute data as root (BREAKS occasionally with d3>3)
    if(d.target.data.annotation) {
      d.target[d.target.data.annotation] = d.target.data.annotation;
    }

  });

}


export function syncEdgeLabels() {

  this.links.forEach(d => {

    // TODO: Move away from storing attribute data as root (BREAKS occasionally with d3>3)
    d[this.selection_attribute_name] =
      d.target[this.selection_attribute_name] || false;
    d.tag = d.target.tag || false;

  });

  if (this.countHandler()) {

    let counts = {};

    counts[
      this.selection_attribute_name
    ] = this.links.reduce((p, c) => {
      return p + (c[this.selection_attribute_name] ? 1 : 0);
    }, 0);

    counts["tagged"] = this.links.reduce(function(p, c) {
      return p + (itemTagged(c) ? 1 : 0);
    }, 0);

    events.countUpdate(this, counts, this.instanceId);

  }

}

export function edgeVisible(edge) {
  return !(edge.target.hidden || edge.target.notshown || false);
}

export function edgeCssSelectors(css_classes) {
  return [
    css_classes["branch"],
    css_classes["selected-branch"],
    css_classes["tagged-branch"],
    css_classes["main-branch"]
  ].reduce(function(p, c, i, a) {
    return (p += "path." + c + (i < a.length - 1 ? "," : ""));
  }, "");
}

export function placeAlongAnEdge (e, where) {
    return this.edge_placer (e, where);
}
